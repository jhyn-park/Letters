import React, { useEffect, useRef } from 'react';
import { desktopConfig as config } from 'constants/letterConfig';
import { drawCenterImage, drawText } from './utils';
type Props = {
	content: string;
	imageUrl: string;
	canvasRef: React.RefObject<HTMLCanvasElement>;
};

function Index({ content, imageUrl, canvasRef }: Props) {
	// const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');

		if (!canvas || !ctx) return;

		// 배경 이미지 그리기
		const img = new Image();
		img.src = config.bgSrc;
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			ctx.drawImage(img, 0, 0, config.canvas.width, config.canvas.height);

			// 왼쪽 이미지 그리기
			const img2 = new Image();
			img2.src = imageUrl;
			img2.crossOrigin = 'anonymous';
			img2.onload = () => {
				// img2 의 중앙 좌표
				drawCenterImage(
					ctx,
					img2,
					config.imageBox.y,
					config.imageBox.x,
					config.imageBox.width,
					config.imageBox.height,
				);
				// 로고 그리기
				const img3 = new Image();
				img3.src = config.logo.src;
				img3.crossOrigin = 'anonymous';
				img3.onload = () => {
					ctx.drawImage(img3, config.logo.x, config.logo.y, config.logo.width, config.logo.height);
				};
			};

			// 우측 글씨 그리기
			drawText(ctx, content, config.letterBox, config.font);
		};
	}, []);

	return (
		<>
			<canvas
				id="desktop-letter-canvas"
				width={config.canvas.width}
				height={config.canvas.height}
				ref={canvasRef}
			></canvas>
		</>
	);
}

export default Index;
