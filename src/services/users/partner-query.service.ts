import { PartnerProfileModel } from "../../models/users/partner-profile.model";

// Search by organization name, type, email
export function buildSearchQuery(search: string) {
  if (search && typeof search === "string" && search.trim() !== "") {
    return {
      $or: [
        { "organization.name": { $regex: search, $options: "i" } },
        { "organization.email": { $regex: search, $options: "i" } },
        { "organization.type": { $regex: search, $options: "i" } }
      ]
    };
  }
  return {};
}

// Filter by type, status, tier, country
export function buildFilterQuery({ type, status, tier, country }: { type?: string; status?: string; tier?: string; country?: string }) {
  const filter: any = {};
  if (type) filter["organization.type"] = type;
  if (status) filter["status"] = status;
  if (tier) filter["tier"] = tier;
  if (country) filter["organization.country"] = country;
  return filter;
}

// Sort by name, createdAt, tier, status
import { SortOrder } from "mongoose";

export function buildSortQuery(sort: string, order: string): { [key: string]: SortOrder } {
  const sortFields: Record<string, string> = {
    name: "organization.name",
    createdAt: "createdAt",
    tier: "tier",
    status: "status"
  };
  const sortBy = sortFields[sort] || "createdAt";
  const sortOrder: SortOrder = order === "asc" ? 1 : -1;
  return { [sortBy]: sortOrder };
}

// Pagination
export function buildPagination(page: number, limit: number) {
  const pageNum = Math.max(Number(page), 1);
  const pageSize = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * pageSize;
  return { skip, pageNum, pageSize };
}

// Compose all queries
export const getPartners = async ({
  search = "",
  type,
  status,
  tier,
  country,
  page = 1,
  limit = 20,
  sort = "createdAt",
  order = "desc"
}: {
  search?: string;
  type?: string;
  status?: string;
  tier?: string;
  country?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}) => {
  const filter = {
    ...buildFilterQuery({ type, status, tier, country }),
    ...buildSearchQuery(search)
  };
  const sortQuery = buildSortQuery(sort, order);
  const { skip, pageNum, pageSize } = buildPagination(page, limit);
  const [partners, total] = await Promise.all([
    PartnerProfileModel.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize),
    PartnerProfileModel.countDocuments(filter)
  ]);
  return {
    partners,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};
