#!/usr/bin/env k8

"use strict";

/*********************************
 * Command-line argument parsing *
 *********************************/

Array.prototype.delete_at = function(i) {
	for (let j = i; j < this.length - 1; ++j)
		this[j] = this[j + 1];
	--this.length;
}

function* getopt(argv, ostr, longopts) {
	if (argv.length == 0) return;
	let pos = 0, cur = 0;
	while (cur < argv.length) {
		let lopt = "", opt = "?", arg = "";
		while (cur < argv.length) { // skip non-option arguments
			if (argv[cur][0] == "-" && argv[cur].length > 1) {
				if (argv[cur] == "--") cur = argv.length;
				break;
			} else ++cur;
		}
		if (cur == argv.length) break;
		let a = argv[cur];
		if (a[0] == "-" && a[1] == "-") { // a long option
			pos = -1;
			let c = 0, k = -1, tmp = "", o;
			const pos_eq = a.indexOf("=");
			if (pos_eq > 0) {
				o = a.substring(2, pos_eq);
				arg = a.substring(pos_eq + 1);
			} else o = a.substring(2);
			for (let i = 0; i < longopts.length; ++i) {
				let y = longopts[i];
				if (y[y.length - 1] == "=") y = y.substring(0, y.length - 1);
				if (o.length <= y.length && o == y.substring(0, o.length)) {
					k = i, tmp = y;
					++c; // c is the number of matches
					if (o == y) { // exact match
						c = 1;
						break;
					}
				}
			}
			if (c == 1) { // find a unique match
				lopt = tmp;
				if (pos_eq < 0 && longopts[k][longopts[k].length-1] == "=" && cur + 1 < argv.length) {
					arg = argv[cur+1];
					argv.delete_at(cur + 1);
				}
			}
		} else { // a short option
			if (pos == 0) pos = 1;
			opt = a[pos++];
			let k = ostr.indexOf(opt);
			if (k < 0) {
				opt = "?";
			} else if (k + 1 < ostr.length && ostr[k+1] == ":") { // requiring an argument
				if (pos >= a.length) {
					arg = argv[cur+1];
					argv.delete_at(cur + 1);
				} else arg = a.substring(pos);
				pos = -1;
			}
		}
		if (pos < 0 || pos >= argv[cur].length) {
			argv.delete_at(cur);
			pos = 0;
		}
		if (lopt != "") yield { opt: `--${lopt}`, arg: arg };
		else if (opt != "?") yield { opt: `-${opt}`, arg: arg };
		else yield { opt: "?", arg: "" };
	}
}

/******************
 * Interval query *
 ******************/

function iit_sort_dedup_copy(a) {
	a.sort((x, y) => (x.st != y.st? x.st - y.st : x.en - y.en));
	const b = [];
	for (let i0 = 0, i = 1; i <= a.length; ++i) {
		if (i == a.length || a[i0].st != a[i].st || a[i0].en != a[i].en) {
			b.push({ st:a[i0].st, en:a[i0].en, max:0 });
			i0 = i;
		}
	}
	return b;
}

function iit_index(a) {
	if (a.length == 0) return -1;
	let last, last_i, k;
	for (let i = 0; i < a.length; i += 2) last = a[i].max = a[i].en, last_i = i;
	for (k = 1; 1<<k <= a.length; ++k) {
		const i0 = (1<<k) - 1, step = 1<<(k+1), x = 1<<(k-1);
		for (let i = i0; i < a.length; i += step) {
			a[i].max = a[i].en;
			if (a[i].max < a[i-x].max) a[i].max = a[i-x].max;
			const e = i + x < a.length? a[i+x].max : last;
			if (a[i].max < e) a[i].max = e;
		}
		last_i = last_i>>k&1? last_i - x : last_i + x;
		if (last_i < a.length) last = last > a[last_i].max? last : a[last_i].max;
	}
	return k - 1;
}

function iit_overlap(a, st, en) {
	let h = 0;
	const stack = [], b = [];
	for (h = 0; 1<<h <= a.length; ++h);
	--h;
	stack.push([(1<<h) - 1, h, 0]);
	while (stack.length) {
		const t = stack.pop();
		const x = t[0], h = t[1], w = t[2];
		if (h <= 3) {
			const i0 = x >> h << h;
			let i1 = i0 + (1<<(h+1)) - 1;
			if (i1 >= a.length) i1 = a.length;
			for (let i = i0; i < i1 && a[i].st < en; ++i)
				if (st < a[i].en) b.push(a[i]);
		} else if (w == 0) { // if left child not processed
			stack.push([x, h, 1]);
			const y = x - (1<<(h-1));
			if (y >= a.length || a[y].max > st)
				stack.push([y, h - 1, 0]);
		} else if (x < a.length && a[x].st < en) {
			if (st < a[x].en) b.push(a[x]);
			stack.push([x + (1<<(h-1)), h - 1, 0]);
		}
	}
	return b;
}

/********************
 * Simpler File I/O *
 ********************/

function* k8_readline(fn) {
	let buf = new Bytes();
	let file = new File(fn);
	while (file.readline(buf) >= 0) {
		yield buf.toString();
	}
	file.close();
	buf.destroy();
}

/*****************
 * main function *
 *****************/

function count(fn, bed, label, opt) {
	let cnt = [];
	for (let i = 0; i < bed.length * 2 + 2; ++i)
		cnt[i] = 0;
	for (const line of k8_readline(fn)) {
		if (line[0] == "#") continue;
		let m, t = line.split("\t");
		if (!/^([A-Za-z]+|<(DEL|DUP)\S*>)$/.test(t[4])) continue; // ignore if sequence is not resolved
		const indel = t[4].length - t[3].length;
		if (opt.eval_ins) {
			if (indel <= 0) continue;
		} else if (opt.eval_del) {
			if (indel >= 0) continue;
		}
		const ctg = t[0];
		const st = parseInt(t[1]) - 1;
		const en = (m = /\bEND=(\d+)/.exec(t[7])) != null? parseInt(m[1]) : st + t[3].length;
		let c = bed.length;
		for (let i = 0; i < bed.length; ++i) {
			if (bed[i][ctg] == null) continue;
			const b = iit_overlap(bed[i][ctg], st, en);
			let cov_st = 0, cov_en = 0, cov = 0;
			for (let j = 0; j < b.length; ++j) {
				let st0 = b[j].st, en0 = b[j].en;
				if (st0 < st) st0 = st;
				if (en0 > en) en0 = en;
				if (st0 > cov_en) {
					cov += cov_en - cov_st;
					cov_st = st0, cov_en = en0;
				} else cov_en = cov_en > en0? cov_en : en0;
			}
			cov += cov_en - cov_st;
			if (cov >= (en - st) * opt.min_frac) {
				c = i;
				break;
			}
		}
		++cnt[c*2];
		if (t[9].indexOf(label) >= 0)
			++cnt[c*2+1];
	}
	return cnt;
}

function main(args) {
	let opt = { min_frac:0.7, eval_ins:false, eval_del:false };
	for (const o of getopt(args, "f:id", [])) {
		if (o.opt == "-f") opt.min_frac = parseFloat(o.arg);
		else if (o.opt == "-i") opt.eval_ins = true;
		else if (o.opt == "-d") opt.eval_del = true;
	}
	if (args.length < 2) {
		print("Usage: truvari-count.js [options] <refine.dir> <reg1.bed> [...]");
		print("Options:");
		print(`  -f FLOAT    min overlap fraction [${opt.min_frac}]`);
		print(`  -i          evaluate insertions only`);
		print(`  -d          evaluate deletions only`);
		return 1;
	}
	let bed = [];
	for (let i = 1; i < args.length; ++i) {
		let b = {};
		for (const line of k8_readline(args[i])) {
			let t = line.split("\t");
			if (b[t[0]] == null) b[t[0]] = [];
			b[t[0]].push({ st: parseInt(t[1]), en: parseInt(t[2]) });
		}
		for (const ctg in b) {
			b[ctg] = iit_sort_dedup_copy(b[ctg]);
			iit_index(b[ctg]);
		}
		bed.push(b);
	}
	const fn = count(`${args[0]}/refine.base.vcf.gz`, bed, ":FN:", opt);
	const fp = count(`${args[0]}/refine.comp.vcf.gz`, bed, ":FP:", opt);
	let a = [];
	for (let i = 0; i < fn.length; ++i) a.push(fn[i]);
	for (let i = 0; i < fp.length; ++i) a.push(fp[i]);
	print(args[0], a.join("\t"));
}

main(arguments);
