import * as simple_v2 from "../samples/simple-v2.json";
import * as simple_classic from "../samples/simple-classic.json";
import * as simple_line_v2 from "../samples/simple-line-v2.json";
import * as simple_line_classic from "../samples/simple-line-classic.json";
import * as simple_area_v2 from '../samples/simple-area-v2.json';
import * as simple_area_classic from '../samples/simple-area-classic.json';
import * as gis_dash from '../samples/GIS-1.json';
import * as simple_text_v2 from '../samples/simple-text-v2.json';
import * as simple_text_classic from '../samples/simple-text-classic.json';
import { convert } from "..";


test('Simple Table Conversion', () => {
    expect(simple_v2).toMatchObject(convert(simple_classic));
});

test('Simple Line Chart Conversion', () => {
    expect(simple_line_v2).toMatchObject(convert(simple_line_classic));
});

test('Simple Area Conversion', () => {
    expect(simple_area_v2).toMatchObject(convert(simple_area_classic));
});

test('Simple Text Panel Conversion', () => {
    expect(simple_text_v2).toMatchObject(convert(simple_text_classic));
})

test('GIS Conversion', () => {
    console.log(JSON.stringify(convert(gis_dash)));
});

