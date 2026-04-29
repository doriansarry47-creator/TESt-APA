import { Router, type IRouter } from "express";
import healthRouter from "./health";
import patientsRouter from "./patients";
import assessmentsRouter from "./assessments";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(patientsRouter);
router.use(assessmentsRouter);
router.use(reportsRouter);

export default router;
