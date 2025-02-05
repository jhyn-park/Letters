import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

// components

import User from '@components/Letter/User';
import Owner from '@components/Letter/Owner';

type Props = {
	isLoaded: boolean;
};

const Index = ({ isLoaded }: Props) => {
	const [param] = useSearchParams();
	const { exhibitionData } = useSelector((state: any) => state.exhibition);
	const owner = sessionStorage.getItem('uid') === exhibitionData.owner ? 'owner' : 'user';

	return owner === 'owner' ? (
		<Owner owner={owner} isLoaded={isLoaded} />
	) : (
		<User owner={owner} isLoaded={isLoaded} />
	);
};

export default Index;
