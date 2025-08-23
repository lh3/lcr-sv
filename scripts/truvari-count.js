#!/usr/bin/env k8

"use strict";

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

function count(fn, bed, label) {
	let cnt = [];
	for (let i = 0; i < bed.length * 2 + 2; ++i)
		cnt[i] = 0;
	for (const line of k8_readline(fn)) {
		if (line[0] == "#") continue;
		let m, t = line.split("\t");
		if (!/^([A-Za-z]+|<DEL\S*>)$/.test(t[4])) continue; // ignore if sequence is not resolved
		const ctg = t[0];
		const st = parseInt(t[1]);
		const en = (m = /\bEND=(\d+)/.exec(t[7])) != null? parseInt(m[1]) : st + t[3].length;
		let c = bed.length;
		for (let i = 0; i < bed.length; ++i) {
			if (bed[i][ctg] == null) continue;
			let b = iit_overlap(bed[i][ctg], st, en);
			if (b.length > 0) {
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
	if (args.length < 2) {
		print("Usage: truvari-count.js <refine.dir> <reg1.bed> [...]");
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
	const fn = count(`${args[0]}/refine.base.vcf.gz`, bed, ":FN:");
	const fp = count(`${args[0]}/refine.comp.vcf.gz`, bed, ":FP:");
	let a = [];
	for (let i = 0; i < fn.length; ++i) a.push(fn[i]);
	for (let i = 0; i < fp.length; ++i) a.push(fp[i]);
	print(args[0], a.join("\t"));
}

main(arguments);
