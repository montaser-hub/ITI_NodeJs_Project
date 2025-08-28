export default function catchError(myFun) {
  return (req, res, next) => {
    myFun(req, res, next).catch((err) => {
      res.status(400).json({ error: err.message });

    });
  };
}
