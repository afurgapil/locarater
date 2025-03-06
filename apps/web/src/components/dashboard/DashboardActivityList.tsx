import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface BaseActivity {
  _id: string;
  createdAt: string;
}

interface LocationActivity extends BaseActivity {
  name: string;
  type: "location";
}

interface ReviewActivity extends BaseActivity {
  locationName: string;
  rating: number;
  comment: string;
  type: "review";
}

interface DashboardActivityListProps {
  activities: {
    locations: Array<Omit<LocationActivity, "type">>;
    reviews: Array<Omit<ReviewActivity, "type">>;
  };
}

export function DashboardActivityList({
  activities,
}: DashboardActivityListProps) {
  const sortedActivities = [
    ...activities.locations.map((loc) => ({
      ...loc,
      type: "location" as const,
    })),
    ...activities.reviews.map((rev) => ({ ...rev, type: "review" as const })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedActivities.map((activity, index) => (
          <li key={activity._id}>
            <div className="relative pb-8">
              {index !== sortedActivities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    {activity.type === "review" ? "⭐" : "📍"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {activity.type === "review"
                        ? `${activity.locationName} mekanına yorum yapıldı`
                        : `${activity.name} mekanı eklendi`}
                    </p>
                    {activity.type === "review" && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {activity.comment}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
