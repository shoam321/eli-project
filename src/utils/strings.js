export const cutString = (text, end = 10) => `${text.slice(0, end)}${text.length > end ? '...' : ''}`;

export default {};
