import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCity } from "@fortawesome/free-solid-svg-icons";

interface CardStatsProps {
  regionName: string;
  branchCount: number;
}

export default function CardStats({ regionName, branchCount }: CardStatsProps) {
  return (
    <div className="min-w-[210px]">
      <div className="relative flex flex-col min-w-0 break-words bg-gray-200 rounded mb-6 xl:mb-0 shadow-lg text-[var(--main-gray)]">
        <div className="flex-auto p-4">
          <div className="flex justify-between items-center">
            <div
              className="text-4xl p-3 mb-3 text-center inline-flex items-center justify-center min-w-16 z-40 rounded-xl relative"
              style={{ background: "var(--mixedColor)" }}
            >
              <FontAwesomeIcon icon={faCity} color="white" className="z-50" />
            </div>
          </div>
          <div className="relative w-full flex flex-col justify-between">
            <div className="w-full relative">
              <p className="text-blueGray-400 min-w-5 uppercase text-xl">
                {regionName}
              </p>
              <span className="text-blueGray-400 min-w-5 uppercase text-xl">
                {branchCount} فروع
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}