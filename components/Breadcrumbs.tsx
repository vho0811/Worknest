/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import { Fragment } from "react";
function Breadcrumbs(){
    const path = usePathname();

    const segments = path.split("/");
    return (
        <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink className="text-sm text-gray-100 hover:text-gray-300" href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
            {segments.map((segment, index) => {
                if (!segment) return null;
                const isLast = index === segments.length - 1;
                return (
                    <Fragment key={segment}>
                    <BreadcrumbSeparator className="text-sm text-gray-100 "/>
                    <BreadcrumbItem key={segment}>
                        {isLast ? (
                            <BreadcrumbPage className="text-sm text-gray-100 hover:text-gray-300">{segment}</BreadcrumbPage>
                        ): (
                            <BreadcrumbLink className="text-sm text-gray-100 hover:text-gray-300" href={`/${segments.slice(0, index + 1).join("/")}`}>
                                {segment}
                            </BreadcrumbLink>
                        )}
                        
                    </BreadcrumbItem>
                    </Fragment>
                )
                })}
      </BreadcrumbList>
    </Breadcrumb>
    )
}
export default Breadcrumbs;