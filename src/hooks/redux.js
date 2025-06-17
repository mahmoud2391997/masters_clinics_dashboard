// src/hooks/redux.ts
import { useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
