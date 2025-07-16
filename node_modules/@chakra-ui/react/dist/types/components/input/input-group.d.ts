import type { BoxProps } from "../box";
import { type InputAddonProps } from "./input-addon";
import { type InputElementProps } from "./input-element";
export interface InputGroupProps extends BoxProps {
    startElementProps?: InputElementProps | undefined;
    endElementProps?: InputElementProps | undefined;
    startElement?: React.ReactNode | undefined;
    endElement?: React.ReactNode | undefined;
    startAddon?: React.ReactNode | undefined;
    startAddonProps?: InputAddonProps | undefined;
    endAddon?: React.ReactNode | undefined;
    endAddonProps?: InputAddonProps | undefined;
    children: React.ReactElement<InputElementProps>;
    startOffset?: InputElementProps["paddingStart"] | undefined;
    endOffset?: InputElementProps["paddingEnd"] | undefined;
}
export declare const InputGroup: import("react").ForwardRefExoticComponent<InputGroupProps & import("react").RefAttributes<HTMLDivElement>>;
