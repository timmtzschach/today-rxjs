import { endOfDay, startOfDay } from "date-fns";
import { Observable, ReplaySubject, finalize, shareReplay } from "rxjs";


interface DateStartAndEndTime {
    startDateTime: number;
    endDateTime: number;
};

export function getDateStartAndEndTime(date: Date): DateStartAndEndTime {
    return { startDateTime: startOfDay(date).getTime(), endDateTime: endOfDay(date).getTime() };
}

let today$Timeout: ReturnType<typeof setTimeout> | undefined | null;
export const today2$ = new Observable<Date>((todaySubscriber) => {
    let today: Date;
    let todayStartAndEndTimes: DateStartAndEndTime;
    let timeout = 0;

    today$Timeout = setTimeout(() => {
        today = new Date();
        todayStartAndEndTimes = getDateStartAndEndTime(today);
        timeout = todayStartAndEndTimes.endDateTime - today.getTime() + 1;
        todaySubscriber.next(today);
        todayStartAndEndTimesAction.next(todayStartAndEndTimes);
    }, timeout);
}).pipe(
    finalize(() => {
        if (today$Timeout) {
            clearTimeout(today$Timeout);
            today$Timeout = null;
        }
    }),
    shareReplay(1),
);

const todayStartAndEndTimesAction = new ReplaySubject<DateStartAndEndTime>(1);
export const todayStartAndEndTimes$ = todayStartAndEndTimesAction.asObservable().pipe(
    shareReplay(1),
);

