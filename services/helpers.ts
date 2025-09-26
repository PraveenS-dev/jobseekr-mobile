export const fixLocalhostUrl = (url: string) => {
  if (!url) return url;
  return url.replace('localhost', '192.168.137.1');
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};


export const getUserRoleName = (id: number) => {
  let Rolename: string | undefined;
  switch (id) {
    case 1:
      Rolename = "JobSeeker";
      break;
    case 2:
      Rolename = "Admin";
      break;
    case 3:
      Rolename = "Employee";
      break;
    default:
      Rolename = "Undefined";
      break;
  }
  return Rolename;
}
