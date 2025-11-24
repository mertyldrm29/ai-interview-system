package com.backend.service;

import com.backend.entity.Interview;
import com.backend.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import com.backend.entity.enums.InterviewStatus;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewCleanupService {

    private final InterviewRepository interviewRepository;
    
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkAbandonedInterviews(){
        LocalDateTime thresholdTime = LocalDateTime.now().minusMinutes(15);

        List<Interview> abandonedInterviews = interviewRepository.findAllByStatusAndStartTimeBefore(InterviewStatus.ACTIVE, thresholdTime);

        if (!abandonedInterviews.isEmpty()){
            System.out.println("Terk edilmiş mülakatlar bulundu: " + abandonedInterviews.size() + " adet");

            for(Interview interview : abandonedInterviews){
                interview.setStatus(InterviewStatus.ABANDONED);
                interview.setEndTime(LocalDateTime.now());
                interviewRepository.save(interview);
            }
        }
}
}