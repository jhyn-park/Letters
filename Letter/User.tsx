import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from '@store';

// data
import { firestore } from '@lib/firebase';

// stores
import { useLetterStore } from 'store/letter';

// styles
import styled from '@emotion/styled';
import { IconButton } from '@mui/material';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';

import Triangle from '@images/svg/Triangle';
import New from '@images/svg/New';

// components
import Read from '@components/Letter/Modal/Read';
import { setLetterModalTypeAction } from '@reducers/letter';

type Props = {
	owner: string;
	isLoaded: boolean;
};

const Owner = ({ owner, isLoaded }: Props) => {
	const dispatch = useDispatch();
	const { id: exhibitionId } = useSelector((state: any) => state.exhibition.exhibitionData);
	const { letterModalType } = useSelector(state => state.letter);
	const [tooltip, setTooltip] = useState(false);
	const [hidden, setHidden] = useState(true);
	const [open, setOpen] = useState(false);

	const [data, setData] = useState([]);
	const [letterId, setLetterId] = useState('');
	const [notRead, setNotRead] = useState(false);
	const [empty, setEmpty] = useState(false);
	const [like, setLike] = useState(0);
	const [view, setView] = useState(0);
	const [imageLink, setImageLink] = useState('');
	const [message, setMessage] = useState('');

	useEffect(() => {
		setHidden(false);
		setTooltip(true);
		firestore()
			.collection('Letter')
			.where('exhibitionId', '==', exhibitionId)
			.where('isDeleted', '==', false)
			.where('isSent', '==', true)
			.where('isOwnerViewed', '==', true)
			// .where('isPublic', '==', true)
			.where('from', '==', 'admin')
			.orderBy('createdAt', 'desc')
			.limit(1)
			.get()
			.then(querySnapshot => {
				if (querySnapshot.empty) {
					setEmpty(true);
					return;
				}

				const item = querySnapshot.docs[0].data();

				if (item.letterId) {
					setLetterId(item.letterId);
					setLike(item.likes?.total || 0);
					setView(item.views?.total || 0);
					setImageLink(item.imageLink || '');
					setMessage(item.message || '');
				}

				if (!item.isOwnerViewed) {
					setNotRead(true);
				}

				setData([item]);
			});
		const timeout = setTimeout(() => {
			setTooltip(false);
		}, 10000);
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (!tooltip) {
			const timeout = setTimeout(() => {
				setHidden(true);
			}, 300);
			return () => clearTimeout(timeout);
		} else {
			setHidden(false);
		}
	}, [tooltip]);

	const handleMouseEnter = () => {
		setTooltip(true);
		setHidden(false);
	};

	const handleMouseLeave = () => {
		setTooltip(false);
	};

	return (
		<>
			<Box>
				{data.length > 0 && (
					<>
						{isLoaded && (
							<LetterButton onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
								{sessionStorage.getItem(`read_${letterId}`) === 'true' ? null : (
									<Badge>
										<New />
									</Badge>
								)}

								<MailOutlineRoundedIcon
									onClick={() => {
										dispatch(setLetterModalTypeAction('read'));
										sessionStorage.setItem(`read_${letterId}`, 'true');
									}}
								/>
							</LetterButton>
						)}
						{!hidden && isLoaded && (
							<Tooltip tooltip={tooltip}>
								{sessionStorage.getItem(`read_${letterId}`) === 'true' ? null : (
									<>
										<Triangle />
										<Text>
											블리스랜드로부터 <br /> <span>편지가 도착</span>했어요
										</Text>
									</>
								)}
							</Tooltip>
						)}
					</>
				)}
			</Box>
			<Read
				letterId={letterId}
				setNotRead={setNotRead}
				owner={owner}
				like={like}
				setLike={setLike}
				view={view}
				imageLink={imageLink}
				message={message}
				open={letterModalType === 'read'}
				onClose={() => {
					dispatch(setLetterModalTypeAction(''));
				}}
			/>
		</>
	);
};

export default Owner;

const Box = styled.div`
	position: fixed;
	bottom: 20px;
	left: 20px;
	z-index: 100;
	display: flex;
	align-items: flex-end;
	gap: 10px;
	@media (max-width: 900px) {
		bottom: auto;
		left: auto;
		top: 120px;
		right: 25px;
		flex-direction: row-reverse;
		align-items: flex-start;
	}
`;

const LetterButton = styled(IconButton)`
	position: relative;
	background-color: #fff !important;
	color: #000;
	border-radius: 15px;
	padding: 5px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
	width: 48px;
	height: 48px;
	& .MuiSvgIcon-root {
		font-size: 30px;
	}
	&:hover {
		background-color: #f4f4f4;
	}

	@media (max-width: 900px) {
		width: 40px;
		height: 40px;
		border-radius: 10px !important;
		& .MuiSvgIcon-root {
			font-size: 24px;
		}
	}
`;

const Tooltip = styled.div<{ tooltip: boolean }>`
	display: flex;
	align-items: center;
	opacity: ${({ tooltip }) => (tooltip ? 1 : 0)};
	visibility: ${({ tooltip }) => (tooltip ? 'visible' : 'hidden')};
	transition: opacity 0.3s ease, visibility 0.3s ease;
	> svg {
		margin-top: 25px;
		opacity: 0.78;
	}
	@media (max-width: 900px) {
		flex-direction: row-reverse;
		> svg {
			margin-top: 10px;
			transform: rotate(180deg);
		}
	}
`;

const Text = styled.p`
	margin: 0;
	padding: 15px 30px;
	background-color: #292928ca;
	border-radius: 10px;
	text-align: center;
	color: #fff;
	& span {
		color: #9060eb;
		font-weight: bold;
	}

	@media (max-width: 900px) {
		font-size: 13px;
		padding: 10px 15px;
	}
`;

const Badge = styled.div`
	position: absolute;
	top: -10px;
	right: -10px;
`;
