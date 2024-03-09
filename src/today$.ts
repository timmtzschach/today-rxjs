import { endOfDay, startOfDay } from "date-fns";
import { Observable, ReplaySubject, combineLatest, map, shareReplay } from "rxjs";

interface DateStartAndEndTime {
    startDateTime: number;
    endDateTime: number;
};

const todayAction = new ReplaySubject<Date>(1);
export const today$ = todayAction.asObservable().pipe(
    shareReplay(1),
);

const todayStartAndEndTimesAction = new ReplaySubject<DateStartAndEndTime>(1);
export const todayStartAndEndTimes$ = todayStartAndEndTimesAction.asObservable().pipe(
    shareReplay(1),
);

export function isToday$(date$: Observable<Date | undefined>): Observable<boolean> {
    return combineLatest([date$, todayStartAndEndTimes$]).pipe(
        map(([date, todayStartAndEndTimes]) => {
            if (!date) {
                return false;
            }
            const dateTime: number = date.getTime();
            return dateTime >= todayStartAndEndTimes.startDateTime && dateTime <= todayStartAndEndTimes.endDateTime;
        })
    );
}

export function getDateStartAndEndTime(date: Date): DateStartAndEndTime {
    return { startDateTime: startOfDay(date).getTime(), endDateTime: endOfDay(date).getTime() };
}

(function scheduleToday$SetTimeoutUpdater(): void {
    let todayStartAndEndTimes: DateStartAndEndTime;
    let today: Date;
    let timeout = 0;
    // @TODO add Subject.next() via setter Object.defineProperty, but typing is currently not supported by TS

    const setTodayTimeout = () => setTimeout(() => {
        today = new Date();
        todayStartAndEndTimes = getDateStartAndEndTime(today);
        todayAction.next(today);
        todayStartAndEndTimesAction.next(todayStartAndEndTimes);
        timeout = todayStartAndEndTimes.endDateTime - Date.now() + 1; // + 1 to get over the treshold for the next day
    }, timeout);

    setTodayTimeout();
})();
