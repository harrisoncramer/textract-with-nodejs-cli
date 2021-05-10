import program from "commander";
import { textractScan, textractGetResult } from "./textractUtils";

program.version("0.0.1").description("Textract");
program
  .command("scan <filePath>")
  .alias("s")
  .description("scans a file")
  .action(async (fileName: string) => {
    try {
      const res = await textractScan(fileName);
      console.log("JobId is: ", res.JobId);
    } catch (err) {
      console.error("ERROR FROM AWS: ", err);
    }
  });

program
  .command("get <jobid>")
  .alias("g")
  .description("gets the result of a scan")
  .action(async (jobId: string) => {
    try {
      const res = await textractGetResult(jobId);
      if (res.JobStatus !== "SUCCEEDED") {
        console.error(res);
        throw new Error("The job did not succeed.");
      }

      // Setup word blocks from result set
      let wordBlocks = res.Blocks?.filter(
        (v) => v.BlockType === "PAGE" || v.BlockType === "WORD"
      );

      if (!wordBlocks) {
        throw new Error("No word blocks found in file.");
      }

      let noDashesRegexp = RegExp(/(- |")/g);
      let resultString = wordBlocks
        .reduce((agg, v) => {
          if (!v.Text || parseInt(v.Text) > 0) {
            return agg;
          }
          return agg + " " + v.Text;
        }, "")
        .replace(noDashesRegexp, "");
      console.log(resultString);
    } catch (err) {
      console.error("ERROR FROM AWS: ", err);
    }
  });

program.parse(process.argv);
