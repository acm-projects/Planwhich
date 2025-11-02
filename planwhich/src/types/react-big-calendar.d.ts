declare module 'react-big-calendar' {
  import * as React from 'react';

  export interface Event {
    title?: string;
    start?: Date | string;
    end?: Date | string;
    allDay?: boolean;
    [key: string]: any;
  }

  export interface CalendarProps extends React.ComponentProps<"div"> {
    localizer?: any;
    events?: Event[];
    startAccessor?: string | ((e: Event) => Date);
    endAccessor?: string | ((e: Event) => Date);
    selectable?: boolean;
    onSelectEvent?: (event: Event) => void;
    onSelectSlot?: (slotInfo: any) => void;
    dayPropGetter?: (date: Date) => any;
    eventPropGetter?: (event: Event) => any;
    [key: string]: any;
  }

  export const Calendar: React.ComponentType<CalendarProps>;
  export function momentLocalizer(moment: any): any;

  const _default: any;
  export default _default;
}
