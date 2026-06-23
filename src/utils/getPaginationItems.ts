export type PaginationItem = number | "ellipsis";

export function getPaginationItems(
  current: number,
  total: number
): PaginationItem[] {
  const pages = Array.from({ length: total }, (_, index) => index + 1).filter(
    number =>
      number === 1 || number === total || Math.abs(number - current) <= 1
  );

  return pages.reduce<PaginationItem[]>((items, number, index) => {
    const previous = pages[index - 1];
    if (previous && number - previous > 1) items.push("ellipsis");
    items.push(number);
    return items;
  }, []);
}
