function isEmail(email: string) {
  const regx = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (regx.exec(email)) return true;
  return false;
}

function parseTime(duration: string) {
  const unitsList = duration.split(' ');
  const value = unitsList[0];
  const unit = unitsList[1];
  const day = 24 * 60 * 60; // convert day to seconds
  const hour = 60 * 60;
  const min = 60;
  
  let timeInSeconds: number;

  if (unit.startsWith('day')) {
    timeInSeconds = Number(value) * day;
  } else if (unit.startsWith('hour')) {
    timeInSeconds = Number(value) * hour;
  } else {
    timeInSeconds = Number(value) * min;
  }
  return timeInSeconds;
}

export { isEmail, parseTime };