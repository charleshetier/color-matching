import { Observable } from 'rxjs';

export const takeWhileInclusive = <T>(predicate: (value: T) => boolean) =>
  (source: Observable<T>) =>
    new Observable<T>(observer => {
      let hasAlreadyMatched = false; // fix
      return source.subscribe({
        next: e => {
          if (hasAlreadyMatched) {
            observer.complete();
          }
          else {
            if (!predicate(e)) {
              hasAlreadyMatched = true; // prevents from having stackoverflow issue here
            }

            observer.next(e);
          }
        },
        error: (e) => observer.error(e),
        complete: () => observer.complete()
      });
    });