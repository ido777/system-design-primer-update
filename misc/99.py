# Calculate downtime for 99.9% and 99.99% availability using a year of 365.25 days
seconds_in_year = 365.25 * 24 * 3600  # Total seconds in an average year

# Availability levels
availability_999  = 0.999
availability_9999 = 0.9999

# Downtime (in seconds) for each availability level
downtime_999  = seconds_in_year * (1 - availability_999)
downtime_9999 = seconds_in_year * (1 - availability_9999)

def format_time(seconds):
    """Returns a tuple (hours, minutes, seconds) given a total seconds value."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds - hours * 3600 - minutes * 60
    return hours, minutes, secs

# Downtime breakdown for 99.9%
year_999 = downtime_999
month_999 = downtime_999 / 12
week_999 = downtime_999 / (365.25 / 7)
day_999 = downtime_999 / 365.25

# Downtime breakdown for 99.99%
year_9999 = downtime_9999
month_9999 = downtime_9999 / 12
week_9999 = downtime_9999 / (365.25 / 7)
day_9999 = downtime_9999 / 365.25

print("99.9% Availability:")
h, m, s = format_time(year_999)
print(f"  Downtime per year: {h}h {m}m {s:.1f}s")
h, m, s = format_time(month_999)
print(f"  Downtime per month: {m}m {s:.1f}s")  # Hours should be 0 for monthly breakdown
h, m, s = format_time(week_999)
print(f"  Downtime per week: {m}m {s:.1f}s")   # Hours should be 0 for weekly breakdown
h, m, s = format_time(day_999)
print(f"  Downtime per day: {m}m {s:.1f}s")      # Hours should be 0 for daily breakdown

print("\n99.99% Availability:")
h, m, s = format_time(year_9999)
if h > 0:
    print(f"  Downtime per year: {h}h {m}m {s:.1f}s")
else:
    print(f"  Downtime per year: {m}m {s:.1f}s")
h, m, s = format_time(month_9999)
print(f"  Downtime per month: {m}m {s:.1f}s")
h, m, s = format_time(week_9999)
print(f"  Downtime per week: {m}m {s:.1f}s")
h, m, s = format_time(day_9999)
print(f"  Downtime per day: {m}m {s:.1f}s")
