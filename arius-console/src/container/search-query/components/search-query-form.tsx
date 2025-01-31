import React, { memo, useEffect, useState } from "react";
import { Button, Form, Input } from "antd";
import "./search-query-form.less";
import { SelectTime } from "./select-time";
import { PERIOD_RADIO_MAP, PERIOD_RADIO } from "../config";

interface SearchQueryFormPropsType {
  setSearchQuery: (params) => void;
  reload?: boolean;
}
export const SearchQueryForm: React.FC<SearchQueryFormPropsType> = memo(
  ({ setSearchQuery, reload }) => {
    const dates = PERIOD_RADIO_MAP.get("oneDay").dateRange;
    const [startTime, setStartTime] = useState(dates[0].valueOf());
    const [endTime, setEndTime] = useState(dates[1].valueOf());
    const [queryIndex, setQueryIndex] = useState("");
    const onTimeStampChange = (startDate, endDate) => {
      setStartTime(startDate);
      setEndTime(endDate);
    };
    const onSearch = () => {
      setSearchQuery &&
        setSearchQuery({
          queryIndex,
          startTime,
          endTime,
        });
    };
    return (
      <div className="search-query-from-box">
        <div className="search-query-from-box-item">
          <Form.Item label="查询索引" name="queryIndex" >
            <Input
              placeholder="请输入"
              style={{ width: 200 }}
              value={queryIndex}
              onChange={(e) => {
                const { value } = e.target;
                setQueryIndex(value);
              }}
            />
          </Form.Item>
        </div>
        <div className="search-query-from-box-item">
          <SelectTime
            onTimeStampChange={onTimeStampChange}
            periodRadio={PERIOD_RADIO}
            periodRadioMap={PERIOD_RADIO_MAP}
            reload={reload}
          />
        </div>
        <div className="search-query-from-box-item">
          <Button type="primary" onClick={onSearch}>
            查询
          </Button>
        </div>
      </div>
    );
  }
);
