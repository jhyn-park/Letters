import React, { useEffect, useRef, useState } from 'react';
import DesktopLetter from './Device/Desktop';
import MobileLetter from './Device/Mobile';
import styled from '@emotion/styled';
import { CircularProgress, TextField } from '@mui/material';
import { downloadImage } from './Device/utils';
import Modal from '@mui/material/Modal';
import { useDevice, useMobileStore } from 'hooks/useDevice';
import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Eye from '@images/svg/Eye';
import DownloadIcon from '@images/svg/Download';

// data
import { firestore } from '@lib/firebase';
import axios from 'axios';
import { useSelector } from '@store';
import { LetterApis } from 'api/letter';
import isIos from '@utils/isIos';

type Props = {
	open: boolean;
	onClose: () => void;
	letterId: string;
	setNotRead: (data: any) => void;
	owner: string;
	like: number;
	setLike: (data: number) => void;
	view: number;
	imageLink: string;
	message: string;
};

function Index({
	open,
	onClose,
	letterId,
	setNotRead,
	owner,
	like,
	view,
	setLike,
	imageLink,
	message,
}: Props) {
	useDevice();
	const { exhibitionData } = useSelector(state => state.exhibition);
	const desktopCanvasRef = useRef<HTMLCanvasElement>(null);
	const mobileCanvasRef = useRef<HTMLCanvasElement>(null);
	const { isMobile } = useMobileStore();
	const [newLoad, setNewLoad] = useState(true);
	const clicked = sessionStorage.getItem(`like_${letterId}`) === 'true';
	const [imageLoaded, setImageLoaded] = useState(false);

	useEffect(() => {
		if (letterId && open && owner === 'owner') {
			firestore()
				.collection('Letter')
				.doc(letterId)
				.get()
				.then(doc => {
					if (doc.exists) {
						const data: any = doc.data();
						const updateFields: any = { isOwnerViewed: true };

						if (!data.isOwnerViewed) {
							updateFields.viewedAt = firestore.FieldValue.serverTimestamp();
							LetterApis.readLetter({
								exhibitionId: exhibitionData.id,
								status: 'read',
							}).then(res => {
								console.log('letter read: ', res.data.code === '2000');
							});
						}

						firestore()
							.collection('Letter')
							.doc(letterId)
							.update(updateFields)
							.then(() => {
								setNotRead(false);
							})
							.catch(error => {
								console.error('Error updating document:', error);
							});

						// read api
					} else {
						console.warn('Document does not exist.');
					}
				})
				.catch(error => {
					console.error('Error fetching document:', error);
				});
			setNotRead(false);
		}
	}, [letterId, open]);

	useEffect(() => {
		if (letterId) {
			const isViewed = sessionStorage.getItem(`view_${letterId}`);

			if (!isViewed) {
				firestore()
					.collection('Letter')
					.doc(letterId)
					.update({
						views: {
							total: firestore.FieldValue.increment(1),
						},
					})
					.then(() => {
						sessionStorage.setItem(`view_${letterId}`, 'true');
					});
			}
		}
	}, [open]);

	const handleLikeClick = () => {
		if (sessionStorage.getItem(`like_${letterId}`) === 'true') return;

		setLike(like + 1);
		sessionStorage.setItem(`like_${letterId}`, 'true');
		firestore()
			.collection('Letter')
			.doc(letterId)
			.update({
				likes: {
					total: firestore.FieldValue.increment(1),
				},
			});
	};

	return (
		<Modal open={open} onClose={onClose}>
			<Container>
				{newLoad ? (
					<>
						<Top>
							<CounBox>
								<LikeCount>
									<FavoriteIcon />
									<span>{like}</span>
								</LikeCount>
								<ViewCount>
									<Eye />
									<span>{view}</span>
								</ViewCount>
							</CounBox>
							<CloseButton onClick={onClose}>
								<Close />
							</CloseButton>
						</Top>
						<LetterContainer isMobile={isMobile}>
							{isMobile ? (
								<CardWrap>
									<MobileLetter
										imageUrl={imageLink}
										content={message}
										canvasRef={mobileCanvasRef}
										setImageLoaded={setImageLoaded}
									/>
								</CardWrap>
							) : (
								<DesktopLetter
									imageUrl={imageLink}
									content={message}
									canvasRef={desktopCanvasRef}
								/>
							)}
							{owner === 'owner' ? (
								<>
									{false ? (
										<>
											<Download
												onClick={() =>
													downloadImage(
														(isMobile ? mobileCanvasRef : desktopCanvasRef).current,
														isMobile ? '블리스랜드에서_온_편지.png' : '블리스랜드에서_온_편지.png',
													)
												}
											>
												<DownloadIcon />
												이미지로 저장하기
											</Download>
										</>
									) : imageLoaded ? (
										<>
											<TextInform>꾹 눌러서 다운로드 해주세요</TextInform>
										</>
									) : (
										<TextInform>
											편지를 불러오고 있습니다{' '}
											<CircularProgress
												size="small"
												style={{ width: 30, height: 30, color: '#5E1380' }}
											/>
										</TextInform>
									)}
								</>
							) : clicked ? (
								''
							) : (
								<Like onClick={handleLikeClick}>
									<FavoriteBorderIcon />
									좋아요
								</Like>
							)}
						</LetterContainer>
					</>
				) : (
					<CircularProgress />
				)}
			</Container>
		</Modal>
	);
}

export default Index;

const Container = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;

	transform: translate(-50%, -50%);
	:focus-visible {
		outline: none;
	}
	@media (max-width: 900px) {
		width: 90%;
		margin: 0 auto;
	}
`;

const Top = styled.div`
	position: absolute !important;
	top: -30px;
	right: 0px;
	z-index: 11;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	@media (max-width: 900px) {
		position: static !important;
	}
`;

const CounBox = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 10px;
`;

const LikeCount = styled.div`
	display: flex;
	align-items: center;
	gap: 5px;
	& > span {
		color: #fff;
	}
	& > svg {
		font-size: 16px;
		color: #fff;
	}
`;

const ViewCount = styled.div`
	display: flex;
	align-items: center;
	gap: 5px;
	& > span {
		color: #fff;
	}
	& > svg {
		font-size: 16px;
		color: #fff;
	}
`;

const LetterContainer = styled.div<{ isMobile: boolean }>`
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: ${props => (props.isMobile ? '10px' : '20px')};
	:focus-visible {
		outline: none;
	}
	& > canvas {
		max-width: ${props => (props.isMobile ? '300px' : '600px')};
		max-height: ${props => (props.isMobile ? '800px' : '500px')};
	}
`;

const Download = styled(Button)`
	min-width: 50%;
	padding: 10px;
	background-color: #4a288b !important;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	border-radius: 6px !important;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #fff !important;
	font-size: 1rem;
	text-align: center;
	gap: 5px;
	:hover {
		background-color: #5c3aa5 !important;
	}
	@media (max-width: 900px) {
		width: 95%;
	}
`;

const CloseButton = styled(IconButton)`
	padding: 0;
	background: none;
	border: none;
	cursor: pointer;
	color: #fff !important;
	font-size: 1.5rem;
	display: block;
	:hover {
		color: #fff;
	}
`;

const Like = styled(Button)`
	width: 50%;
	padding: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 5px;
	background-color: #4a288b !important;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	border-radius: 6px !important;
	color: #fff !important;
	font-size: 1rem;
	cursor: pointer;
	:hover {
		background-color: #5c3aa5 !important;
	}
	& > svg {
		font-size: 1rem;
	}
	@media (max-width: 900px) {
		width: 95%;
	}
`;

const CardWrap = styled.div`
	height: calc(100dvh - 100px);
	overflow-y: auto;
	& canvas {
		width: 100%;
	}
	& img {
		width: 100%;
	}
`;

const TextInform = styled.div`
	color: #fff;
	font-size: 1rem;
	height: 30px;
	font-family: 'Noto Sans KR', sans-serif;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 20px;
`;
