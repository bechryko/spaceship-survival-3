import { Star } from './stars';

export function tickStars(stars: Star[], deltaTime: number): void {
  for (const star of stars) {
    star.phase += star.speed * deltaTime;
  }
}
