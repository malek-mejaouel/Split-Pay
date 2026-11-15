package com.splitpay.savings.mapper;

import com.splitpay.savings.dto.RoundUpResponse;
import com.splitpay.savings.entity.RoundUp;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoundUpMapper {

    RoundUpResponse toResponse(RoundUp roundUp);
}
