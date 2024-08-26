function toDate(date, isTimezoneOffset = true) {
  if (typeof date === 'string') {
    if (isTimezoneOffset) {
      // Setting Date without the timezone changing the resulting hour
      return new Date(new Date(date).getTime() + (new Date().getTimezoneOffset()* (1000 * 60)));
    } else {
      return new Date(date);
    }
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
  
  // Convert milliseconds to total minutes (integer part)
  const totalMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
  
  // Calculate the remaining seconds after converting to minutes
  const remainingSeconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);
  
  return {
    minutes: totalMinutes,
    seconds: remainingSeconds
  };
}

const formatTime = (isoString) => {
  try {
    const date = toDate(isoString, false);

    // Extract hours and minutes
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
    // Format as HH:MM
    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Error while converting string of time.")
    return '';
  }
}

const formatDate = (dateStr) => {
  try {
    const date = toDate(dateStr, false);
    
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error.message);
    return null; // or return a fallback value
  }
}

export {
  toDate,
  getMinutesDifference,
  formatTime,
  formatDate,
};