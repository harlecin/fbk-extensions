import type { DriverSpec } from '../deck/schema';
export declare function DriverTree({ root, branches, rootPath, branchesPath, }: {
    root: string;
    branches: DriverSpec[];
    /** `data-edit` paths for the two specs — passed separately because this
     * component renders two independent props of its layout. */
    rootPath?: string;
    branchesPath?: string;
}): import("react").JSX.Element;
