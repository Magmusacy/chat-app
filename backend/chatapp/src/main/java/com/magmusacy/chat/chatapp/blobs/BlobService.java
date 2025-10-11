package com.magmusacy.chat.chatapp.blobs;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobContainerClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
public class BlobService {
    private final BlobContainerClient blobContainerClient;

    public BlobService(@Value("${azure.storage.connection-string}") String connectionString,
                       @Value("${azure.storage.blob-container-name}") String containerName) {
        this.blobContainerClient = new BlobContainerClientBuilder()
                .connectionString(connectionString)
                .containerName(containerName)
                .buildClient();
    }

    @Transactional
    public String uploadBlob(User user, MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        BlobClient blobClient = blobContainerClient.getBlobClient(fileName);
        BlobHttpHeaders headers = new BlobHttpHeaders().setContentType(file.getContentType());

        blobClient.upload(file.getInputStream(), file.getSize(), true);
        blobClient.setHttpHeaders(headers);
        try {
            return blobClient.getBlobUrl();
        } catch (Exception e) {
            blobClient.delete();
            throw e;
        }
    }

    @Transactional
    public void deleteBlob(String blobUrl) {
        String containerName = blobContainerClient.getBlobContainerName();
        String blobName = blobUrl.substring(blobUrl.indexOf(containerName) + containerName.length() + 1);
        BlobClient blobClient = blobContainerClient.getBlobClient(blobName);
        blobClient.deleteIfExists();
;    }
}
