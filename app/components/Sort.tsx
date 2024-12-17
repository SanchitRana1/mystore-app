'use client'
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';
import { sortTypes } from '@/constants';

const Sort = () => {
  const router = useRouter();
  const path = usePathname()
  const handleSort =(value: string) =>{
    router.push(`${path}?sort=${value}`)
  }
	return (
		<Select onValueChange={handleSort} defaultValue={sortTypes[0].value}>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder={sortTypes[0].value} />
			</SelectTrigger>
			<SelectContent>
        {sortTypes.map(item=> <SelectItem key={item.label} value={item.value} className='shad-select-item'>{item.label}</SelectItem> )}
			</SelectContent>
		</Select>
	);
};

export default Sort;
