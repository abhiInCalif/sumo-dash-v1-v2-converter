import { convert, DashboardV1 } from "."
import fs from 'fs';

const main = (args: string[]) => {
    if (args.length == 0) {
        console.log("You must provide a file path");
        return;
    }

    const data = fs.readFileSync(args[0], 'utf-8');
    const dataJson = JSON.parse(data);
    // console.log(data);
    console.log(JSON.stringify(convert(dataJson)));
}

main(process.argv.slice(2));