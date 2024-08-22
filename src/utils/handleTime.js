function toDate(date) {
  if (typeof date === 'string') {
    return new Date(date);
  } else if (date instanceof Date) {
    return date;
  } else {
    throw new Error('Invalid date format');
  }
}

function getMinutesDifference(date1, date2) {
  // Ensure date1 and date2 are Date objects
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    throw new Error('Both parameters should be Date objects.');
  }
  
  // Get the time difference in milliseconds
  const differenceInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
  
  // Convert milliseconds to minutes
  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
  
  return differenceInMinutes;
}