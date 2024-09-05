const isWeekly = activeChartTab === "week";
const timeFormat = isWeekly ? "ddd" : "MMM";

const dataKeys = isWeekly
  ? Array.from({length: 7}, (_, i) =>
      moment().subtract(i, "days").format(timeFormat),
    ).reverse()
  : Array.from({length: 12}, (_, i) =>
      moment().subtract(i, "months").format(timeFormat),
    ).reverse();

const initializeDataMap = (keys, defaultValue) =>
  keys.reduce((acc, key) => {
    acc[key] = {...defaultValue};
    return acc;
  }, {});

const userChartDataMap = initializeDataMap(dataKeys, {
  totalUsers: 0,
  newUsers: 0,
  returningUsers: 0,
});

userChartResponse.forEach((item) => {
  const dateKey = moment(item.created_at).format(timeFormat);
  if (userChartDataMap[dateKey]) {
    userChartDataMap[dateKey].totalUsers++;
    item.isNewUser
      ? userChartDataMap[dateKey].newUsers++
      : userChartDataMap[dateKey].returningUsers++;
  }
});

// Prepare user chart data
const userChartData = dataKeys.map((key) => ({
  label: key,
  totalUsers: userChartDataMap[key].totalUsers,
  newUsers: userChartDataMap[key].newUsers,
  returningUsers: userChartDataMap[key].returningUsers,
}));

setUserChartData({
  labels: dataKeys,
  totalUsersCount: userChartData.map((data) => data.totalUsers),
  newUsersCount: userChartData.map((data) => data.newUsers),
  returningUsersCount: userChartData.map((data) => data.returningUsers),
});

// For calculate totalUsersCount, newUsersCount and returningUsersCount use deviceToken,
// every unique deviceToken means a user for calculate totalUser
// if same deviceToken exist 2 or more time that mean returningUser
// If deviceToken exist only one time that mean newUser
