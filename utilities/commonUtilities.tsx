// Utility function to convert date to a pretty format in local timezone
export function convertToPrettyDateFormatInLocalTimezone(
  inputDate: Date
): string {
  const date = inputDate.getDate();
  const month = inputDate.getMonth() + 1;
  const year = inputDate.getFullYear();

  const hours =
    inputDate.getHours() > 12
      ? inputDate.getHours() - 12
      : inputDate.getHours() === 0
        ? 12
        : inputDate.getHours();

  const minutes =
    inputDate.getMinutes() < 10
      ? "0" + inputDate.getMinutes()
      : inputDate.getMinutes();
  const amOrPm = inputDate.getHours() >= 12 ? "PM" : "AM";

  let fullDate = `${date}/${month}/${year}`;

  let today = new Date();

  if (
    inputDate.toLocaleDateString() ===
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toLocaleDateString()
  ) {
    fullDate = "Today";
  }

  return `${fullDate} at ${hours}:${minutes} ${amOrPm}`;
}
