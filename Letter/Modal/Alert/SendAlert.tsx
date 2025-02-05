import React from 'react';

import styled from '@emotion/styled';
import Modal from '@mui/material/Modal';
import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';

type Props = {
	open: boolean;
	onClose: () => void;
};

const SendAlert = ({ open, onClose }: Props) => {
	return (
		<Modal open={open} onClose={onClose}>
			<Container>
				<Box>
					<CloseButton onClick={onClose}>
						<Close />
					</CloseButton>
					<p>블리스랜드에 편지를 보냈습니다.</p>
					<CustomButton onClick={onClose}>확인</CustomButton>
				</Box>
			</Container>
		</Modal>
	);
};

export default SendAlert;

const Container = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

const Box = styled.div`
	position: relative;
	min-width: 300px;
	min-height: 100px;

	box-sizing: border-box;
	background-color: white;
	border-radius: 5px;
	box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
	padding: 20px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 10px;
	& p {
		margin: 0;
		padding: 0;
		word-break: keep-all;
		word-wrap: break-word;
		text-align: center;
		margin: 15px 0;
	}
`;

const CloseButton = styled(IconButton)`
	position: absolute !important;
	top: 5px;
	right: 5px;
	& svg {
		color: black;
	}
`;

const CustomButton = styled(Button)`
	background-color: #4a288b !important;
	padding: 5px 10px;
	border-radius: 5px;
	cursor: pointer;
	color: white !important;
	&:hover {
		background-color: #5f3ba6;
	}
`;
