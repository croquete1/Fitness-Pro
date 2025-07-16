import { type HTMLChakraProps, type SystemStyleObject } from "../../styled-system";
export interface GridOptions {
    templateColumns?: SystemStyleObject["gridTemplateColumns"] | undefined;
    autoFlow?: SystemStyleObject["gridAutoFlow"] | undefined;
    autoRows?: SystemStyleObject["gridAutoRows"] | undefined;
    autoColumns?: SystemStyleObject["gridAutoColumns"] | undefined;
    templateRows?: SystemStyleObject["gridTemplateRows"] | undefined;
    templateAreas?: SystemStyleObject["gridTemplateAreas"] | undefined;
    column?: SystemStyleObject["gridColumn"] | undefined;
    row?: SystemStyleObject["gridRow"] | undefined;
    inline?: boolean | undefined;
}
export interface GridProps extends Omit<HTMLChakraProps<"div">, keyof GridOptions>, GridOptions {
}
export declare const Grid: import("react").ForwardRefExoticComponent<GridProps & import("react").RefAttributes<HTMLDivElement>>;
