import { useState, type SetStateAction } from "react";

export const usePagination = (initialData = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataset, setDataset] = useState<Leaderboard>(initialData);

  const pageCount = Math.ceil(dataset.length / itemsPerPage);
  const currentData = dataset.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const changePage = (page: SetStateAction<number>) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    setCurrentPage((current) => (current < pageCount ? current + 1 : current));
  };

  const prevPage = () => {
    setCurrentPage((current) => (current > 1 ? current - 1 : current));
  };

  return { currentData, currentPage, pageCount, changePage, nextPage, prevPage, setDataset };
};
