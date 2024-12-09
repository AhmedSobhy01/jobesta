SELECT p.job_id, p.freelancer_id, p.status, p.cover_letter, p.created_at, a.username, a.first_name, a.last_name, a.profile_picture, m.order milestone_order, m.status milestone_status, m.name, m.duration,m.amount  FROM proposals p 
        JOIN jobs j ON p.job_id = j.id 
        JOIN freelancers f ON p.freelancer_id = f.id
        JOIN milestones m ON m.job_id = j.id and m.freelancer_id = f.id 
        JOIN accounts a ON f.account_id = a.id
        WHERE p.job_id = 1 AND j.client_id = 2