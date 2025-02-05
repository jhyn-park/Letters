import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from '@store';

// data
import { firestore } from '@lib/firebase';

// styles
import styled from '@emotion/styled';
import New from '@images/svg/New';
import Triangle from '@images/svg/Triangle';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { IconButton } from '@mui/material';

// components
import Modal from '@components/Letter/Modal';
import Read from '@components/Letter/Modal/Read';
import Write from '@components/Letter/Modal/Write';
import OwnerAlert from './Modal/Alert/OwnerAlert';
import SendAlert from './Modal/Alert/SendAlert';
import { setLetterModalTypeAction } from '@reducers/letter';

type Props = {
	owner: string;
	isLoaded: boolean;
};

const Owner = ({ owner, isLoaded }: Props) => {
	const dispatch = useDispatch();

	const {
		exhibitionData: { id: exhibitionId, firstLetterRead },
	} = useSelector(state => state.exhibition);
	const { letterModalType } = useSelector(state => state.letter);

	const [tooltip, setTooltip] = useState(false);
	const [hidden, setHidden] = useState(true);
	const [open, setOpen] = useState(false);
	const [sendAlert, setSendAlert] = useState(false);
	const [ownerAlert, setOwnerAlert] = useState(false);

	const [data, setData] = useState<Letter[]>([]);
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
			// .where('isPublic', '==', true)
			.where('from', '==', 'admin')
			.orderBy('createdAt', 'desc')
			.limit(1)
			.get()
			.then(querySnapshot => {
				if (!querySnapshot.empty) {
					const data: Letter[] = querySnapshot.docs.map(doc => {
						return { id: doc.id, ...(doc.data() as any) } as Letter;
					});
					setData(data);
					if (!data[0].isOwnerViewed) {
						setNotRead(true);
					}
				} else {
					setEmpty(true);
				}
			});

		const timeout = setTimeout(() => {
			setTooltip(false);
		}, 10000);
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (data.length > 0) {
			setLetterId(data[0].letterId);
			setLike(data[0].likes.total);
			setView(data[0].views.total);
			setImageLink(data[0].imageLink);
			setMessage(data[0].message);
		}
	}, [data]);

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

	const handleCloseFirstOwnerAlert = () => {
		firestore().collection('Exhibition').doc(exhibitionId).update({
			firstLetterRead: true,
		});
		setOwnerAlert(false);
	};
	return (
		<>
			<Box>
				<LetterButton onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
					{notRead && (
						<Badge>
							<New />
						</Badge>
					)}
					<MailOutlineRoundedIcon
						onClick={() => {
							setOpen(true);
						}}
					/>
				</LetterButton>
				{!hidden && isLoaded && (
					<Tooltip tooltip={tooltip}>
						<Triangle />
						{notRead ? (
							<Text>
								블리스랜드로부터 <br /> <span>편지가 도착</span>했어요
							</Text>
						) : (
							<Text>
								소중한 아이에게 <br /> 편지를 보내보세요.
							</Text>
						)}
					</Tooltip>
				)}
			</Box>
			<Modal
				notRead={notRead}
				empty={data.length === 0}
				setOwnerAlert={setOwnerAlert}
				open={open}
				onClose={() => setOpen(false)}
			/>
			<Read
				letterId={letterId}
				setNotRead={setNotRead}
				owner={owner}
				like={like}
				setLike={setLike}
				view={view}
				imageLink={imageLink}
				message={message}
				open={letterModalType === 'read' && !ownerAlert}
				onClose={() => {
					dispatch(setLetterModalTypeAction(''));
				}}
			/>
			<Write
				setSendAlert={setSendAlert}
				open={letterModalType === 'write'}
				onClose={() => {
					dispatch(setLetterModalTypeAction(''));
				}}
			/>
			<SendAlert open={sendAlert} onClose={() => setSendAlert(false)} />
			<OwnerAlert open={ownerAlert && !firstLetterRead} onClose={handleCloseFirstOwnerAlert} />
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
			margin-top: 0px;
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
	white-space: pre-line;
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
