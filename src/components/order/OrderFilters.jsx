"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OrderFilters = ({
  searchTerm,
  setSearchTerm,
  dateRange,
  handleDateRangeChange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  handleCustomApply,
  status,
  setStatus,
  clotheType,
  setClotheType,
  finishingType,
  setFinishingType,
  colour,
  setColour,
  sillName,
  setSillName,
  quality,
  setQuality,
  showMoreFilters,
  setShowMoreFilters,
  data,
}) => {
  return (
    <div className="flex flex-wrap justify-between gap-4 mb-6 items-center">
      {/* Search */}
      <input
        type="text"
        placeholder="Search order or and coustomer name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:w-96 border border-gray-300 rounded px-4 py-2"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center flex-grow min-w-[300px]">
        {/* Date Range */}
        <select
          className="border border-gray-300 rounded px-4 py-2 min-w-[150px]"
          value={dateRange}
          onChange={(e) => handleDateRangeChange(e.target.value)}
        >
          <option value="">Date range</option>
          <option value="this_week">This week</option>
          <option value="this_month">This month</option>
          <option value="last_week">Last week</option>
          <option value="last_month">Last month</option>
          <option value="last_3_days">Last 3 days</option>
          <option value="custom">Custom</option>
        </select>

        {/* Custom date pickers */}
        {dateRange === "custom" && (
          <div className="flex items-center gap-2">
            <DatePicker
              selected={customStartDate}
              onChange={(date) => setCustomStartDate(date)}
              placeholderText="Start Date"
              className="border border-gray-300 rounded px-4 py-2"
            />
            <DatePicker
              selected={customEndDate}
              onChange={(date) => setCustomEndDate(date)}
              placeholderText="End Date"
              className="border border-gray-300 rounded px-4 py-2"
            />
            <button
              onClick={handleCustomApply}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Apply
            </button>
          </div>
        )}

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 min-w-[150px]"
        >
          <option value="">Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Clothe Type */}
        <select
          value={clotheType}
          onChange={(e) => setClotheType(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 min-w-[150px]"
        >
          <option value="">Clothe Type</option>
          {data?.clotheTypes?.map((item) => (
            <option key={item?._id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        {/* Hidden filters */}
        {showMoreFilters && (
          <>
            <select
              value={finishingType}
              onChange={(e) => setFinishingType(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 min-w-[150px]"
            >
              <option value="">Finishing Type</option>
              {data?.finishingTypes?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 min-w-[150px]"
            >
              <option value="">Colour</option>
              {data?.colours?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={sillName}
              onChange={(e) => setSillName(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 min-w-[150px]"
            >
              <option value="">Sill Name</option>
              {data?.sillNames?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 min-w-[150px]"
            >
              <option value="">Quality</option>
              {data?.qualities?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* More Filters Button */}
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="cursor-pointer text-blue-600 border border-gray-300 rounded px-4 py-2 min-w-[150px] ml-auto"
          type="button"
        >
          {showMoreFilters ? "Hide Filters" : "More Filters"}
        </button>
      </div>
    </div>
  );
};

export default OrderFilters;
