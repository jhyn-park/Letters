export const drawCenterImage = (ctx: CanvasRenderingContext2D, img, y, x, width, height) => {
	const centerX = img.width / 2;
	const centerY = img.height / 2;
	//이미지가 가로로 길면
	if (img.width > img.height) {
		const sh = img.height;
		const sw = img.height * (width / height);
		const sy = 0;
		const sx = centerX - ((width / height) * sh) / 2;
		ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
	} else {
		const sw = img.width;
		const sh = img.width * (height / width);
		const sx = 0;
		const sy = centerY - ((height / width) * sw) / 2;

		ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
	}
};

export const drawText = (ctx: CanvasRenderingContext2D, content: string, letterBox, font) => {
	const _font = new FontFace(font.family, `url(${font.src})`);

	_font.load().then(loadedFont => {
		document.fonts.add(loadedFont);
		ctx.font = `${font.size}px ${font.family}`;
		ctx.fillStyle = font.color;

		// 줄바꿈 포함 글 작성
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		let text = '';
		const x = letterBox.x;
		let y = letterBox.y;
		const maxWidth = letterBox.width;
		const lineHeight = font.lineHeight;
		const lines = content.split('\n');

		for (let i = 0; i < lines.length; i++) {
			text = lines[i];
			let line = '';
			let words = text.split(' ');
			for (let n = 0; n < words.length; n++) {
				let testLine = line + words[n] + ' ';
				let metrics = ctx.measureText(testLine);
				let testWidth = metrics.width;
				if (testWidth > maxWidth && n > 0) {
					ctx.fillText(line, x, y);
					line = words[n] + ' ';
					y += lineHeight;
				} else {
					line = testLine;
				}
			}
			ctx.fillText(line, x, y);
			y += lineHeight;
		}
	});
};

export const downloadImage = (canvas: HTMLCanvasElement, fileName: string) => {
	const link = document.createElement('a');
	link.download = fileName;
	link.href = canvas.toDataURL('image/png');
	link.click();
};
