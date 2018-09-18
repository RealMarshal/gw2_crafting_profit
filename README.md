# GW2 Crafting Profit
Analyzes web scraped data about GW2's crafted items &amp; trading post prices to calculate how profitable it is to craft an item

## Usage

*Note: you can track all the progress in Console window*

*Warning: this **README** was created much later than the project. The instructions below represent my experience of attempting to launch it more than a year later. I had to push a fix to make it work. You may encounter problems I haven't experienced.*

1. Execute ```npm install``` & ```node main.js```
2. Create directories ```items```, ```modified_items```, ```sorted_data```
3. Go to *localhost:3000*
4. Click **Get new items**
5. Type in starting & ending pages (the more, the better, recommended at least ~10) or leave default values
6. Click **Update sold/bought** (can take a lot of time)
7. When completed click **Update profit/SBPR**. In case of errors like ```Unexpected token , in JSON at position...``` make sure that all files' content in modified_items starts with **[**
8. Click **Update sorted data**
9. Refresh the page
10. Enjoy! Use sorting by **SBPR** most of the times.

Used technologies:
- Node.js & Express
- SocketIO
- Nightmare.js
- SkeletonUI
