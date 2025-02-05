import React, { useEffect, useState } from 'react';

// stores
import { useLetterStore } from 'store/letter';

// styles
import styled from '@emotion/styled';
import New from '@images/svg/New';
import { Modal } from '@mui/material';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from '@store';
import { setLetterModalTypeAction } from '@reducers/letter';

type Props = {
	open: boolean;
	onClose: () => void;
	notRead: boolean;
	empty: boolean;
	setOwnerAlert: (arg0: boolean) => void;
};

const Index = ({ open, onClose, notRead, empty, setOwnerAlert }: Props) => {
	const dispatch = useDispatch();
	const {
		exhibitionData: { firstLetterRead },
	} = useSelector(state => state.exhibition);

	return (
		<Modal open={open} onClose={onClose}>
			<Container>
				<LetterButton
					onClick={() => {
						dispatch(setLetterModalTypeAction('write'));
						onClose();
					}}
				>
					편지 보내기
				</LetterButton>
				<Box
					style={{
						position: 'relative',
					}}
				>
					<LetterButton
						disabled={empty}
						onClick={() => {
							dispatch(setLetterModalTypeAction('read'));
							onClose();
							if (notRead && !firstLetterRead) {
								setOwnerAlert(true);
							}
						}}
					>
						편지 확인하기
					</LetterButton>
					{notRead && <New />}
				</Box>
			</Container>
		</Modal>
	);
};

export default Index;

const Container = styled.div`
	position: fixed;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	z-index: 100;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20px;
	:focus-visible {
		outline: none;
	}
	@media (max-width: 900px) {
		width: 50%;
		gap: 10px;
	}
`;

const Box = styled.div`
	position: relative;
	& svg {
		position: absolute;
		top: -10px;
		right: -10px;
		width: 20px;
		height: 20px;
		z-index: 10;
	}
	@media (max-width: 900px) {
		width: 100%;
	}
`;

const LetterButton = styled(Button)<{ disabled?: boolean }>`
	position: relative;
	background-color: ${({ disabled }) => (disabled ? '#b9b9b9' : '#fff')} !important;
	border-radius: 1.75px !important;
	padding: 10px 30px;
	color: #4a288b !important;
	font-size: 14px;
	font-weight: bold;
	min-width: 270px !important;
	&:hover {
		background-color: #4a288b !important;
		color: #fff !important;
		transition: all 0.25s;
	}
	@media (max-width: 900px) {
		min-width: 100% !important;
	}
`;
