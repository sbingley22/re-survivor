# Re Survivor

Live Link: https://sbingley22.github.io/re-survivor/

Description:
Survive a zombie and mutant infection.

TODO:
add shotgun, machine gun, items
add character select with unique attributes (jill extra speed, leon more health, etc)
add level up system where upon level up (score thresholds) random abilities unlocked
add active abilities (rechargable)
add passive abilities (damage increase, speed increase, armour)
add score system
enemies can randomly drop score (run over to collect)
score increase with time and kills


To get Xbox Controller Working I had to change in package.json
"react-gamepad": "^1.0.3" to "react-gamepad": "SBRK/react-gamepad",
then run npm i

git subtree push --prefix dist origin gh-pages