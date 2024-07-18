export const joiValidator = (schema) => (data) => {
  const { error, value } = schema(data);

  if (!error) return { value };

  return {
    value,
    err: error.details.map((e) => e.message),
  };
};
