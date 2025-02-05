import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import axios from 'axios';

import { firestore } from '@lib/firebase';

// styles
import styled from '@emotion/styled';

import { Modal } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import letterImage from 'images/letter.png';
import LetterLine from 'images/letterLine.png';
import MobileLetterLine from '@images/mobileLetterLine.png';
import useIsMobile from '@hooks/useIsMobile';

type Props = {
	open: boolean;
	onClose: () => void;
	setSendAlert: (value: boolean) => void;
};

const Write = ({ open, onClose, setSendAlert }: Props) => {
	const { exhibitionData } = useSelector((state: any) => state.exhibition);
	const [isLoading, setLoading] = useState(false);
	const [text, setText] = useState('');
	const MAX_LENGTH = 200;
	const isMobile = useIsMobile();
	const boxRef = React.useRef<HTMLDivElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const value = e.target.value;
		const maxLine = isMobile ? 11 : 8;
		const lineHeight = isMobile ? 55 : 37;
		const maxHeight = lineHeight * maxLine;
		if (value.length > MAX_LENGTH) {
			alert(`최대 ${MAX_LENGTH}자까지 입력 가능합니다.`);
			return;
		} else if (e.currentTarget.scrollHeight > maxHeight) {
			alert(`최대 ${maxLine}줄까지 입력 가능합니다.`);
			return;
		} else {
			setText(value);
		}
	};

	const submitLetter = async (text: string) => {
		const data = {
			createdAt: firestore.FieldValue.serverTimestamp(),
			updatedAt: firestore.FieldValue.serverTimestamp(),
			viewedAt: null,
			message: text,
			deletedAt: null,
			letterId: '',
			exhibitionId: exhibitionData.id,
			exhibitionTitle: exhibitionData.title,
			from: 'owner',
			isDeleted: false,
			imageLink: '',
			isOwnerViewed: false,
			isPublic: false,
			isSent: true,
			likes: {
				total: 0,
			},
			views: {
				total: 0,
			},
			sentAt: firestore.FieldValue.serverTimestamp(),
			uid: exhibitionData.owner,
		};
		const docRef = await firestore().collection('Letter').add(data);

		await docRef.update({ letterId: docRef.id });
		return docRef.id;
	};

	const sendLetter = async () => {
		setLoading(true);
		try {
			await submitLetter(text);
			await axios.post('https://us-central1-onthewall-fps.cloudfunctions.net/fpsApi/send/email', {
				exhibitionId: exhibitionData.id,
				exhibitionUrl: `https://memory.fourpaws.co.kr/${exhibitionData.id}`,
				text,
			});

			setLoading(false);
			onClose();
			setText('');
			setSendAlert(true);
		} catch (error) {
			console.error('Error sending letter:', error);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!open) {
			setText('');
		}
	}, [open]);

	return (
		<Modal open={open} onClose={onClose}>
			<Container>
				<CloseButton onClick={onClose}>
					<Close />
				</CloseButton>
				<Box ref={boxRef}>
					<LetterText>
						<TextField
							fullWidth
							multiline
							value={text}
							placeholder={`내용을 입력해 주세요 \n(글자 수는 200자 까지 작성 가능합니다)`}
							rows={isMobile ? 11 : 8}
							maxRows={isMobile ? 11 : 8}
							inputProps={{
								style: {
									resize: 'none',
								},
							}}
							onChange={e => {
								handleChange(e);
							}}
						/>
					</LetterText>
					<MobileLetterLineImage
						src={MobileLetterLine}
						alt="letterLine"
						height={boxRef.current?.clientHeight ?? 100}
					/>
					<Count>
						<span className={MAX_LENGTH - text.length === 0 ? 'limit' : ''}>
							{MAX_LENGTH - text.length}
						</span>{' '}
						/ {MAX_LENGTH}
					</Count>
				</Box>
				<SendButton disabled={isLoading} onClick={sendLetter}>
					편지 보내기
				</SendButton>
			</Container>
		</Modal>
	);
};
// 텍스트 크기 조정 필요
// 플레이스 홀더
export default Write;

const Container = styled.div`
	position: fixed;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	z-index: 100;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 20px;
	:focus-visible {
		outline: none;
	}
	@media (max-width: 500px) {
		position: absolute;
		width: 100dvw;
		height: 100dvh;
		left: 0px;
		top: 0px;
		transform: none;
		box-sizing: border-box;
		justify-content: space-between;
		overflow-y: auto;
		padding: 22px;
		background: url('/assets/letterBackground.png') no-repeat top / cover;
	}
`;

const Box = styled.div`
	position: relative;
	width: 619px;
	height: 360px;
	background-color: #fafafa;
	background: url('/assets/letterPC.png') no-repeat top/ contain;
	@media (max-width: 660px) {
		width: 300px;
		max-height: 600px;
		height: 100%;
		margin-top: 0px;
		background: url('/assets/letterBackground.png') no-repeat top / cover;
		overflow-y: auto;
		overflow-x: hidden;
		// 스크롤바 디자인 변경
		&::-webkit-scrollbar {
			width: 0px;
		}
		&::-webkit-scrollbar-thumb {
			background-color: #4a288b;
		}
		&::-webkit-scrollbar-track {
			background-color: #f1f1f1;
		}
	}
	@media (max-width: 500px) {
		margin-top: 30px;
		max-height: none;
	}
`;

const CloseButton = styled(IconButton)`
	position: absolute !important;
	top: -30px;
	right: 0px;
	padding: 0;
	z-index: 11;
	background: none;
	border: none;
	cursor: pointer;
	color: #fff;
	font-size: 1.5rem;
	display: block;
	:hover {
		color: #fff;
	}
	@media (max-width: 660px) {
		top: 5px;
		right: 5px;
	}
	@media (max-width: 500px) {
		top: 10px;
		right: 10px;
		color: #4a288b;
	}
`;

const LetterText = styled.div`
	margin-top: 30px;
	padding: 0 37.5px;
	.MuiInputBase-root {
		width: 100%;
		height: 100%;
		padding: 0;
		font-family: 'HakgyoansimChilpanjiugaeTTF-B';
		font-size: 1.38rem;
		line-height: 37px;
		word-break: keep-all;
		word-wrap: break-word;
		@media (max-width: 660px) {
			width: 100%;
			height: 590px;
			display: flex;
			align-items: flex-start;
			margin-top: 0;
			font-size: 1.7rem;
			line-height: 52.5px;
			z-index: 1;
		}
		@media (max-width: 500px) {
			width: 300px;
			min-width: 300px;
			max-width: 300px;
			line-height: 55px;
		}
	}
	& .MuiOutlinedInput-notchedOutline {
		border: none;
	}
	@media (max-width: 660px) {
		margin-top: 10px;
		padding: 0 20px;
	}
	@media (max-width: 500px) {
		padding: 0;
	}
`;

const SendButton = styled(Button)`
	width: 300px;
	min-width: 300px;
	max-width: 300px;
	margin: 0 auto;
	margin-bottom: 20px !important;
	padding: 10px;
	background-color: #4a288b !important;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	border-radius: 6px !important;
	color: #fff !important;
	font-size: 1rem;
	:hover {
		background-color: #5f3ba6 !important;
	}
	@media (max-width: 660px) {
		margin-top: auto;
	}
`;

const Count = styled.div`
	position: absolute;
	bottom: 10px;
	right: 35px;
	z-index: 1;
	font-size: 0.8rem;

	color: #4a288b;
	& .limit {
		color: red;
		font-weight: 700;
	}
	@media (max-width: 660px) {
		right: 15px;
	}
	@media (max-width: 500px) {
		right: 20px;
	}
`;

const MobileLetterLineImage = styled.img<{ height: number }>`
	position: absolute;
	left: 0;
	top: 55px;
	width: 100%;
	height: 550px;

	@media (min-width: 500px) {
		box-sizing: border-box;
		top: 30px;
		padding: 20px;
		height: calc(100% - 30px);
	}
	@media (min-width: 661px) {
		display: none;
	}
`;
