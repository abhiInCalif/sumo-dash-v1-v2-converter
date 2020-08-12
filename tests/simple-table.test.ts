import * as simple_v2 from "../src/samples/simple-v2.json";
import * as simple_classic from "../src/samples/simple-classic.json";
import * as simple_line_v2 from "../src/samples/simple-line-v2.json";
import * as simple_line_classic from "../src/samples/simple-line-classic.json";
import * as simple_area_v2 from '../src/samples/simple-area-v2.json';
import * as simple_area_classic from '../src/samples/simple-area-classic.json';
import { convert } from "../src";


test('Simple Table Conversion', () => {
    expect(simple_v2).toMatchObject(convert(simple_classic));
});

test('Simple Line Chart Conversion', () => {
    expect(simple_line_v2).toMatchObject(convert(simple_line_classic));
});

test('Simple Area Conversion', () => {
    expect(simple_area_v2).toMatchObject(convert(simple_area_classic));
});

