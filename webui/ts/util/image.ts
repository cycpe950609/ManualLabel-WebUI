import { flatten } from "lodash";

export function Grey2RGBA(img: number[][]) {
    let img_grey_array = flatten(img);
    let tmp_img_rgb_array = img_grey_array.map((greyColor: number) => {
        return [greyColor, greyColor, greyColor, 255];
    });
    // console.log(tmp_img_rgb_array.length);
    // console.log(tmp_img_rgb_array[0].length);
    let img_rgba_array = flatten(tmp_img_rgb_array);
    return img_rgba_array;
}
