const limitText = (description: string, maxLength: number): string => {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength) + '...';
};

export { limitText };
