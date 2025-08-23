#!/usr/bin/env k8

function* k8_readline(fn) {
	let buf = new Bytes();
	let file = new File(fn);
	while (file.readline(buf) >= 0) {
		yield buf.toString();
	}
	file.close();
	buf.destroy();
}

function process(a) {
	if (a.length == 0) return;
	let max_en = 0, flag = 0, max_score = 0;
	for (let i = 0; i < a.length; ++i) {
		if (a[i].label == "mg") flag |= 1;
		else flag |= 2;
		max_en = max_en > a[i].en? max_en : a[i].en;
		max_score = max_score > a[i].score? max_score : a[i].score;
	}
	let s = [];
	if (flag & 1) s.push("mg");
	if (flag & 2) s.push("ldust");
	print(a[0].ctg, a[0].st, max_en, s.join(","), max_score);
}

function main(args) {
	let a = [], max_en = 0;
	for (const line of k8_readline(args[0])) {
		let t = line.split("\t");
		const st = parseInt(t[1]);
		const en = parseInt(t[2]);
		const score = parseInt(t[4]);
		if (a.length > 0 && (a[0].ctg != t[0] || st > max_en)) {
			process(a);
			a.length = 0;
			max_en = en;
		}
		a.push({ ctg:t[0], st:st, en:en, score:score, label:t[3] });
		max_en = max_en > en? max_en : en;
	}
	process(a);
}

main(arguments);
