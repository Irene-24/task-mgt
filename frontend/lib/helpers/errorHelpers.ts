import { ZodError } from "zod";

export const getAPIErrMessage = (
  resp: Record<string, any>,
  defaultMessage?: string
) => {
  if (resp?.response?.data?.message) {
    return resp.response.data.message;
  }

  if (resp?.message) {
    return resp.message;
  }

  if (resp?.error?.data?.message) {
    return resp.error.data.message;
  }

  return defaultMessage || "Error occurred";
};

export function extractZodErrorMapFlat(
  error: ZodError | null | undefined
): Record<string, string> {
  if (!error) {
    return {};
  }

  const errorMap: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.map(String).join(".");
    errorMap[path] = issue.message;
  }

  return errorMap;
}

export const handleFormErrors = (...data: any) => {
  console.log(data);
};
