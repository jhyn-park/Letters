import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';

type Props = {
	open: boolean;
	onClose: () => void;
};

const OwnerAlert = ({ open, onClose }: Props) => {
	useEffect(() => {
		let timer: NodeJS.Timeout;

		if (open) {
			setTimeout(() => {
				onClose();
			}, 3000);
		}
		return () => {
			clearTimeout(timer);
		};
	}, [open, onClose]);

	return (
		<Modal open={open} onClose={onClose} closeAfterTransition>
			<Fade in={open} timeout={{ enter: 1500, exit: 1200 }}>
				<div onClick={onClose}>
					<Box>
						<Text>{`블리스랜드에서 온 편지를 통해 \n 소중한 아이와의 행복했던 기억을 추억하며 \n 마음의 위안이 될 수 있기를 바랍니다.`}</Text>
					</Box>
				</div>
			</Fade>
		</Modal>
	);
};

export default OwnerAlert;

const Box = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	position: fixed;
	top: 0;
	left: 0;
	z-index: 999;
`;

const Text = styled.p`
	margin: 0;
	padding: 0;
	white-space: pre-line;
	word-break: keep-all;
	word-wrap: break-word;
	text-align: center;
	color: #fff;
	font-size: 1.5rem;
	font-weight: bold;
	line-height: 1.5;
	// mobile
	@media (max-width: 500px) {
		font-size: 1.2rem;
	}
`;
